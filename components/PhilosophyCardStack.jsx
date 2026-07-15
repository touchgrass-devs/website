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

// Adapted from react-bits' CardSwap. Two real changes from the original:
// 1) Next.js can't import a plain global .css from a component, so the
//    stylesheet is a CSS module and class names come from `styles.*`.
// 2) The original auto-advances on a `setInterval`. Here advancement is
//    driven entirely from outside via `advance()` (exposed through a ref),
//    called by Philosophy.jsx's GSAP ScrollTrigger as the visitor scrolls
//    through the pinned section - "reveal on scroll", not on a timer.
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
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), reduce ? 0 : skewAmount);
    });
    order.current = Array.from({ length: total }, (_, i) => i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, skewAmount, reduce, refs.length]);

  useImperativeHandle(
    ref,
    () => ({
      advance() {
        if (reduce || order.current.length < 2) return;
        // Kill whatever's mid-flight first. Without this, a fast flick-scroll
        // that fires advance() twice in the same tick leaves two timelines
        // fighting over the same x/y/z - that fight is what reads as "janky."
        tlRef.current?.kill();
        const [front, ...rest] = order.current;
        const elFront = refs[front].current;
        if (!elFront) return;
        const tl = gsap.timeline();
        tlRef.current = tl;
        tl.to(elFront, { y: '+=420', duration: config.durDrop, ease: config.ease });
        tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
        rest.forEach((idx, i) => {
          const el = refs[idx].current;
          if (!el) return;
          const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`);
        });
        const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
        tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
        tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
        tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');
        tl.call(() => {
          order.current = [...rest, front];
        });
      },
      retreat() {
        // Exact mirror of advance() - pulls the back card up to front while
        // everything else steps back a slot. This is what lets scrolling
        // back UP through the section undo a swap instead of ignoring it
        // (which is what was happening before: only onEnter/forward was
        // wired, so scrolling up did nothing and a stray forward re-trigger
        // on the way back down is what produced the out-of-order card flashes).
        if (reduce || order.current.length < 2) return;
        tlRef.current?.kill();
        const total = refs.length;
        const last = order.current[order.current.length - 1];
        const rest = order.current.slice(0, -1);
        const elLast = refs[last].current;
        if (!elLast) return;
        const tl = gsap.timeline();
        tlRef.current = tl;
        tl.set(elLast, { zIndex: total + 1 });
        tl.to(elLast, { x: 0, y: 0, z: 0, duration: config.durMove, ease: config.ease }, 0);
        rest.forEach((idx, i) => {
          const el = refs[idx].current;
          if (!el) return;
          const slot = makeSlot(i + 1, cardDistance, verticalDistance, total);
          tl.set(el, { zIndex: slot.zIndex }, 0);
          tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, 0);
        });
        tl.call(() => {
          order.current = [last, ...rest];
        });
      },
      reset() {
        tlRef.current?.kill();
        const total = refs.length;
        order.current = Array.from({ length: total }, (_, i) => i);
        refs.forEach((r, i) => {
          if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), reduce ? 0 : skewAmount);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardDistance, verticalDistance, skewAmount, reduce]
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
