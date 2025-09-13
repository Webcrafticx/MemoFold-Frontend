// src/components/mainFeed/FloatingHearts.jsx
import { motion } from "framer-motion";

const FloatingHearts = ({ hearts, setHearts }) => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {hearts.map((heart) => (
      <motion.div
        key={heart.id}
        className="absolute text-red-500 text-xl pointer-events-none"
        initial={{
          x: heart.x,
          y: heart.y,
          scale: 0,
          opacity: 1,
        }}
        animate={{
          y: heart.y - 100,
          scale: [0, 1.2, 1],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
        onAnimationComplete={() => {
          setHearts((hearts) => hearts.filter((h) => h.id !== heart.id));
        }}
      >
        ❤️
      </motion.div>
    ))}
  </div>
);

export default FloatingHearts;