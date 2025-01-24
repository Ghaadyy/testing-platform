import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/shadcn/components/ui/menubar";
import { Button } from "@/shadcn/components/ui/button";
import { useContext } from "react";
import { EditorContext } from "@/context/EditorContext";
import { useTheme } from "@/shadcn/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router";
import { useSave } from "@/hooks/useSave";
import { useShortcut } from "@/hooks/useShortcut";

type Props = { onRun: () => void };

function Menu({ onRun }: Props) {
  const { fileId, code } = useContext(EditorContext);
  const { saveDocument } = useSave();
  useShortcut(() => saveDocument(fileId, code), onRun);

  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row gap-3">
      <Menubar className="flex-1">
        <MenubarMenu>
          <MenubarTrigger>
            <Link to="/">Home</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger onClick={() => saveDocument(fileId, code)}>
              Save
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger onClick={onRun} disabled={!fileId}>
              Run
            </MenubarTrigger>
          </MenubarMenu>
        </MenubarMenu>
      </Menubar>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </div>
  );
}

export default Menu;
