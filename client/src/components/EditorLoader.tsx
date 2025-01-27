import { Card, CardContent, CardTitle } from "@/shadcn/components/ui/card";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { ScrollArea } from "@radix-ui/react-scroll-area";

function EditorLoader() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full rounded-lg"
    >
      <ResizablePanel className="flex flex-col gap-3 px-3" defaultSize={50}>
        <Skeleton className="w-full h-full" />
      </ResizablePanel>
      <ResizablePanel defaultSize={50} className="px-3 w-full">
        <Card className="flex flex-col gap-4 h-full">
          <CardTitle className="font-bold text-2xl px-4 pt-4">
            <Skeleton className="w-[50%] h-8" />
          </CardTitle>
          <ScrollArea>
            <CardContent className="px-4 flex flex-col gap-4">
              {Array.from({ length: 10 }).map(() => (
                <Skeleton className="w-full h-10" />
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default EditorLoader;
