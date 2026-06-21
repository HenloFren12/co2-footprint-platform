import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounterAnimation } from './useCounterAnimation';

/**
 * hooks/useCounterAnimation.test.ts
 *
 * Matched exactly to the real implementation:
 *   - initial state is targetValue itself (useState(targetValue))
 *   - the effect bails out early with no RAF call when displayed === targetValue
 *   - ease-out cubic easing: eased = 1 - (1-progress)^3
 *   - cancelAnimationFrame is called in the cleanup function
 *   - default durationMs = 800
 *
 * NOTE: requestAnimationFrame and cancelAnimationFrame are mocked using
 * fake timers so the RAF loop can be driven deterministically in jsdom.
 */
describe('useCounterAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) =>
      setTimeout(() => cb(performance.now()), 16) as unknown as number
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) =>
      clearTimeout(id as unknown as ReturnType<typeof setTimeout>)
    );
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initial render returns the target value itself (no animation from "nothing")', () => {
    const { result } = renderHook(() => useCounterAnimation(50));
    expect(result.current).toBe(50);
  });

  it('does not call requestAnimationFrame on initial mount when there is no change', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    renderHook(() => useCounterAnimation(100));
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('animates toward a new target value when the prop changes after mount', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCounterAnimation(target, 100),
      { initialProps: { target: 50 } }
    );
    expect(result.current).toBe(50);

    rerender({ target: 100 });

    act(() => {
      vi.advanceTimersByTime(150); // past the 100ms duration
    });

    expect(result.current).toBe(100);
  });

  it('reaches the exact target value after the full animation duration elapses', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCounterAnimation(target, 200),
      { initialProps: { target: 0 } }
    );

    rerender({ target: 80 });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe(80);
  });

  it('calls cancelAnimationFrame on unmount during an active animation (no memory leak)', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { rerender, unmount } = renderHook(
      ({ target }) => useCounterAnimation(target, 800),
      { initialProps: { target: 0 } }
    );

    rerender({ target: 200 });
    act(() => {
      vi.advanceTimersByTime(16); // let one RAF tick schedule
    });

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('handles a negative delta (target lower than current) by counting down, not up', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCounterAnimation(target, 100),
      { initialProps: { target: 150 } }
    );
    expect(result.current).toBe(150);

    rerender({ target: 50 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe(50);
  });

  it('uses the default duration of 800ms when no durationMs argument is provided', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCounterAnimation(target),
      { initialProps: { target: 0 } }
    );

    rerender({ target: 10 });

    act(() => {
      vi.advanceTimersByTime(500); // less than 800ms - should not be finished
    });
    expect(result.current).not.toBe(10);

    act(() => {
      vi.advanceTimersByTime(400); // now past 800ms total
    });
    expect(result.current).toBe(10);
  });

  it('returned values are always integers (Math.round applied each tick)', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCounterAnimation(target, 300),
      { initialProps: { target: 0 } }
    );

    rerender({ target: 7 });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(Number.isInteger(result.current)).toBe(true);
  });
});