import { renderHook, act } from '@testing-library/react';
import { useCounterAnimation } from './useCounterAnimation';

describe('useCounterAnimation', () => {
  beforeEach(() => {
    // 1. Initialize fake timers
    jest.useFakeTimers();
    
    // 2. Mock requestAnimationFrame and cancelAnimationFrame for JSDOM
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => 
      setTimeout(() => cb(performance.now()), 16) as unknown as number
    );
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => 
      clearTimeout(id as unknown as NodeJS.Timeout)
    );
  });

  afterEach(() => {
    // 3. Clean up timers and restore native window functions
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns the target value after the animation duration elapses', () => {
    const { result } = renderHook(() => useCounterAnimation(50, 100));
    
    act(() => { 
      // Advance time past the 100ms duration
      jest.advanceTimersByTime(150); 
    });
    
    expect(result.current).toBe(50);
  });

  it('does not start an animation loop when target equals the initial value', () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
    renderHook(() => useCounterAnimation(100, 800));
    
    // No delta, so RAF should not be called
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('calls cancelAnimationFrame on unmount to prevent memory leaks', () => {
    const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useCounterAnimation(200, 800));
    
    unmount();
    
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('handles a negative delta (counter increasing) without crashing', () => {
    const { result } = renderHook(() => useCounterAnimation(150, 100));
    expect(typeof result.current).toBe('number');
  });
});