import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/shadcn/components/ui/menubar";
import { Button } from "@/shadcn/components/ui/button";
import { useContext } from "react";
import { MainContext } from "@/context/MainContext";
import { useTheme } from "@/shadcn/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router";

type Props = {
  onRun: () => void;
  onSave: (fileId: string) => void;
};

function Menu({ onRun, onSave }: Props) {
  const { fileId } = useContext(MainContext);

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
            <MenubarTrigger onClick={() => onSave(fileId)}>Save</MenubarTrigger>
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
