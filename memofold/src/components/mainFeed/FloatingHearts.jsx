import { motion } from "framer-motion";

const FloatingHearts = ({ hearts, setHearts }) => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {hearts.map((heart) => (
      <motion.div
        key={heart.id}
        className="absolute text-red-500 text-2xl pointer-events-none"
        initial={{
          x: heart.x - 12,
          y: heart.y - 12,
          scale: 0,
          opacity: 1,
        }}
        animate={{
          y: heart.y - 150,
          scale: [0, 1.5, 1],
          opacity: [1, 0.8, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 2,
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