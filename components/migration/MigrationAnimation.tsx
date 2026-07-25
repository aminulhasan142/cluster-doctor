"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
} from "lucide-react";

interface MigrationAnimationProps {
  running: boolean;
  source: string;
  target: string;
}

export function MigrationAnimation({
  running,
  source,
  target,
}: MigrationAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (running) {
      setCompleted(false);
      setProgress(0);

      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 2;

          if (next >= 100) {
            clearInterval(timer);
            setCompleted(true);
            return 100;
          }

          return next;
        });
      }, 100);
    } else {
      setProgress(0);
      setCompleted(false);
    }

    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Workload Migration
          </h3>

          <p className="text-sm text-gray-400">
            AI Safe Migration Visualization
          </p>
        </div>

        {completed ? (
          <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
        ) : running ? (
          <div className="flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-400">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Migrating...
          </div>
        ) : (
          <div className="rounded-full bg-zinc-700/40 px-3 py-1 text-gray-400">
            Idle
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <motion.div
          animate={{
            scale: running ? [1, 1.05, 1] : 1,
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-5"
        >
          <Cpu className="mb-2 h-10 w-10 text-red-400" />

          <h4 className="font-semibold text-white">{source}</h4>

          <p className="text-xs text-gray-400 mt-2">
            Source Node
          </p>
        </motion.div>

        <div className="relative h-32 w-64">
          <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full bg-zinc-700" />

          {running && (
            <>
              <motion.div
                className="absolute top-1/2 left-0 h-1 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"
                initial={{ width: 0 }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  ease: "linear",
                }}
              />

              <motion.div
                className="absolute top-1/2 h-5 w-5 rounded-full bg-cyan-300 shadow-[0_0_30px_#22d3ee]"
                animate={{
                  left: `${progress}%`,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={{
                  ease: "linear",
                }}
              />

              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 h-2 w-2 rounded-full bg-cyan-200"
                  initial={{
                    left: 0,
                    opacity: 0,
                  }}
                  animate={{
                    left: "100%",
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear",
                  }}
                />
              ))}
            </>
          )}

          <ArrowRight className="absolute left-1/2 top-[calc(50%-26px)] -translate-x-1/2 text-cyan-400" />
        </div>

        <motion.div
          animate={{
            scale: completed ? [1, 1.08, 1] : 1,
          }}
          transition={{
            repeat: completed ? Infinity : 0,
            duration: 1.2,
          }}
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-5"
        >
          <Cpu className="mb-2 h-10 w-10 text-green-400" />

          <h4 className="font-semibold text-white">
            {target}
          </h4>

          <p className="mt-2 text-xs text-gray-400">
            AI Selected Target
          </p>
        </motion.div>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">
            Migration Progress
          </span>

          <span className="font-semibold text-cyan-400">
            {progress}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-zinc-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400"
            animate={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3">
        {[
          "Checkpoint",
          "Migration",
          "Recovery",
          "Verification",
        ].map((step, index) => {
          const active =
            progress >= (index + 1) * 25 || completed;

          return (
            <motion.div
              key={step}
              animate={{
                scale: active ? [1, 1.04, 1] : 1,
              }}
              transition={{
                duration: 0.4,
              }}
              className={`rounded-xl border p-4 text-center transition-all ${
                active
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-300"
                  : "border-zinc-700 bg-zinc-900/40 text-gray-500"
              }`}
            >
              <div className="text-xs font-semibold">
                {step}
              </div>
            </motion.div>
          );
        })}
      </div>

      {completed && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-400" />

            <div>
              <p className="font-semibold text-green-300">
                Migration Completed Successfully
              </p>

              <p className="text-sm text-gray-400">
                AI safely migrated workload from{" "}
                <span className="text-white">{source}</span> to{" "}
                <span className="text-white">{target}</span>.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}