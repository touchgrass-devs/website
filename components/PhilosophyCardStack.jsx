'use client';

import {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { gsap } from 'gsap';
import styles from './PhilosophyCardStack.module.css';

// Adapted from react-bits' CardSwap. Real changes from the original:
// 1) Next.js can't import a plain global .css from a component, so the
//    stylesheet is a CSS module and class names come from `styles.*`.
// 2) The original auto-advances on a `setInterval`. Here the swap is driven
//    entirely from outside via `setProgress()` (exposed through a ref),
//    called by Philosophy.jsx's GSAP ScrollTrigger on every scroll tick.
// 3) The swap is a continuously scroll-scrubbed transform, not a canned
//    animation fired once a scroll threshold is crossed. An earlier version
//    exposed discrete `advance()`/`retreat()` methods that each played a
//    fixed-duration (~0.85s) timeline once triggered - visually fine, but
//    the shift itself ran on its own clock rather than tracking the
//    scrollbar, so it didn't feel "continuous." `setProgress(p)` (p ranges
//    from 0 to `total - 1`, fractional) instead scrubs a paused GSAP
//    timeline's `.progress()` directly from `p`'s fractional part, so every
//    scroll pixel maps 1:1 to a point in the transition - scroll fast, it
//    shifts fast; stop scrolling, it stops exactly where it is.
export const StackCard = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`${styles.card} ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
StackCard.displayName = 'StackCard';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

// Which card sits in which slot after `step` completed swaps, with no
// mutable rotation state to track - purely a function of `step`, so scroll
// position alone always determines the arrangement (self-correcting in
// both directions, can't drift).
const orderAtStep = (step, total) => Array.from({ length: total }, (_, i) => (step + i) % total);

const PhilosophyCardStack = forwardRef(function PhilosophyCardStack(
  {
    width = 380,
    height = 460,
    cardDistance = 44,
    verticalDistance = 52,
    skewAmount = 4,
    easing = 'elastic',
    reduce = false,
    children,
  },
  ref
) {
  const config =
    easing === 'elastic'
      ? { ease: 'elastic.out(0.6,0.9)', durDrop: 0.85, durMove: 0.85, durReturn: 0.85, promoteOverlap: 0.9, returnDelay: 0.05 }
      : { ease: 'power1.inOut', durDrop: 0.5, durMove: 0.5, durReturn: 0.5, promoteOverlap: 0.45, returnDelay: 0.2 };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );
  const total = refs.length;
  const tlRef = useRef(null);
  const baseStepRef = useRef(-1);
  const container = useRef(null);

  const placeStatic = (step) => {
    const order = orderAtStep(step, total);
    order.forEach((cardIdx, slotIdx) => {
      const el = refs[cardIdx]?.current;
      if (el) placeNow(el, makeSlot(slotIdx, cardDistance, verticalDistance, total), reduce ? 0 : skewAmount);
    });
  };

  useEffect(() => {
    tlRef.current?.kill();
    baseStepRef.current = -1;
    placeStatic(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, skewAmount, reduce, total]);

  // Builds (paused) the transition timeline for the segment starting at
  // `step` - front card (order[0]) drops, the rest promote one slot, the
  // front card returns to the back. Identical motion to the old advance(),
  // just never auto-played - `setProgress` scrubs it with `.progress()`.
  const buildTimeline = (step) => {
    const order = orderAtStep(step, total);
    const [front, ...rest] = order;
    const elFront = refs[front]?.current;
    const tl = gsap.timeline({ paused: true });
    if (!elFront) return tl;

    tl.to(elFront, { y: '+=420', duration: config.durDrop, ease: config.ease });
    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = refs[idx]?.current;
      if (!el) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, total);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`);
    });
    const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    tl.set(elFront, { zIndex: backSlot.zIndex }, 'return');
    tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');
    return tl;
  };

  useImperativeHandle(
    ref,
    () => ({
      setProgress(overallProgress) {
        if (reduce || total < 2) return;
        const steps = total - 1;
        const clamped = Math.max(0, Math.min(steps, overallProgress));
        const baseStep = Math.min(steps - 1, Math.floor(clamped));
        const frac = clamped - baseStep;

        if (baseStepRef.current !== baseStep) {
          // New segment - snap to its exact starting arrangement first, so
          // the fresh timeline's tweens capture the right "from" values,
          // then build and scrub it. Works scrolling either direction since
          // both `placeStatic` and `buildTimeline` are pure functions of
          // `baseStep`, not of whatever the previous segment left behind.
          tlRef.current?.kill();
          placeStatic(baseStep);
          tlRef.current = buildTimeline(baseStep);
          baseStepRef.current = baseStep;
        }
        tlRef.current?.progress(frac);
      },
      reset() {
        tlRef.current?.kill();
        baseStepRef.current = -1;
        placeStatic(0);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardDistance, verticalDistance, skewAmount, reduce, total]
  );

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
        })
      : child
  );

  return (
    <div ref={container} className={styles.container} style={{ width, height }}>
      {rendered}
    </div>
  );
});

export default PhilosophyCardStack;
