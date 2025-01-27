import { Button } from "@/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  errors: string[];
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
};

export function ErrorCard({ errors, setErrors }: Props) {
  return (
    <AnimatePresence>
      {errors.length !== 0 && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 z-50 w-screen"
        >
          <Card className="transition-all">
            <CardHeader className="flex flex-row justify-between items-center px-4 py-2">
              <CardTitle className="text-2xl font-bold">
                Compilation Errors
              </CardTitle>
              <Button
                onClick={() => setErrors([])}
                variant="ghost"
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[30vh] p-4">
                <pre className="text-lg whitespace-pre-wrap text-red-500">
                  {errors.join("\n")}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
