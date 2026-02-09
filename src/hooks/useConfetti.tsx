import { useCallback } from "react";

export const useConfetti = () => {
  const fireConfetti = useCallback(async (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
  }) => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors: ["#00d4aa", "#a855f7", "#f472b6", "#38bdf8"],
        zIndex: 9999,
        ...options,
      });
    } catch (error) {
      console.error("Confetti failed to load:", error);
    }
  }, []);

  const fireSuccessConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 50, angle: 60, spread: 55,
        origin: { x: 0 }, colors: ["#00d4aa", "#10b981", "#22c55e"], zIndex: 9999,
      });
      confetti({
        particleCount: 50, angle: 120, spread: 55,
        origin: { x: 1 }, colors: ["#00d4aa", "#10b981", "#22c55e"], zIndex: 9999,
      });
    } catch (error) {
      console.error("Confetti failed to load:", error);
    }
  }, []);

  const fireStarConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 30, spread: 360, ticks: 60, gravity: 0,
        decay: 0.94, startVelocity: 20, shapes: ["star"],
        colors: ["#fbbf24", "#f59e0b", "#d97706"], scalar: 1.2,
        origin: { x: 0.5, y: 0.5 }, zIndex: 9999,
      });
    } catch (error) {
      console.error("Confetti failed to load:", error);
    }
  }, []);

  const fireFireworks = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#ff0000','#ff7700','#ffff00','#00ff00','#0077ff','#8800ff','#ff00ff'];

      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          particleCount: 80,
          startVelocity: 35,
          spread: 360,
          ticks: 80,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors,
          zIndex: 9999,
        });
      }, 350);
    } catch (error) {
      console.error("Fireworks failed:", error);
    }
  }, []);

  const fireRainbow = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      const rainbowColors = ['#ff0000','#ff7700','#ffff00','#00ff00','#0077ff','#4400ff','#8800ff'];
      
      for (let i = 0; i < 7; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 270,
            spread: 60,
            origin: { x: (i + 0.5) / 7, y: -0.1 },
            colors: [rainbowColors[i], rainbowColors[(i + 1) % 7]],
            gravity: 1.2,
            ticks: 120,
            startVelocity: 15,
            zIndex: 9999,
          });
        }, i * 120);
      }
    } catch (error) {
      console.error("Rainbow failed:", error);
    }
  }, []);

  const fireSideCannons = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      const colors = ['#00d4aa','#a855f7','#f472b6','#38bdf8','#fbbf24'];
      
      // Left cannon
      confetti({
        particleCount: 100, angle: 60, spread: 80,
        origin: { x: 0, y: 0.65 }, colors, startVelocity: 55,
        ticks: 100, zIndex: 9999,
      });
      // Right cannon
      confetti({
        particleCount: 100, angle: 120, spread: 80,
        origin: { x: 1, y: 0.65 }, colors, startVelocity: 55,
        ticks: 100, zIndex: 9999,
      });

      // Second wave
      setTimeout(() => {
        confetti({
          particleCount: 60, angle: 45, spread: 60,
          origin: { x: 0, y: 0.8 }, colors, startVelocity: 45,
          ticks: 80, zIndex: 9999,
        });
        confetti({
          particleCount: 60, angle: 135, spread: 60,
          origin: { x: 1, y: 0.8 }, colors, startVelocity: 45,
          ticks: 80, zIndex: 9999,
        });
      }, 250);
    } catch (error) {
      console.error("Side cannons failed:", error);
    }
  }, []);

  const fireCelebration = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      const colors = ['#00d4aa','#a855f7','#f472b6','#38bdf8','#fbbf24','#ef4444'];

      // Side cannons
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors, startVelocity: 50, ticks: 90, zIndex: 9999 });
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors, startVelocity: 50, ticks: 90, zIndex: 9999 });

      // Delayed center burst
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.5 }, startVelocity: 45, colors, ticks: 100, zIndex: 9999 });
      }, 300);

      // Delayed floating stars
      setTimeout(() => {
        confetti({ particleCount: 40, spread: 360, shapes: ['star'], gravity: 0.2, scalar: 1.5, ticks: 120, startVelocity: 25, origin: { x: 0.5, y: 0.4 }, colors: ['#fbbf24','#f59e0b','#d97706','#ffffff'], zIndex: 9999 });
      }, 700);

      // Final sparkle burst
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 180, origin: { x: 0.5, y: 0.6 }, startVelocity: 15, ticks: 80, gravity: 0.5, colors: ['#ffd700','#ffec8b','#fff8dc'], zIndex: 9999 });
      }, 1100);
    } catch (error) {
      console.error("Celebration failed:", error);
    }
  }, []);

  return {
    fireConfetti,
    fireSuccessConfetti,
    fireStarConfetti,
    fireFireworks,
    fireRainbow,
    fireSideCannons,
    fireCelebration,
  };
};

export default useConfetti;
