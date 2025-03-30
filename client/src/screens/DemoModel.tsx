import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { useState } from "react";

function DemoModel() {
  const [image, setImage] = useState("");
  const [src, setSrc] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files === null || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        console.log(
          JSON.stringify({ image: image.split(",")[1], description })
        );

        const res = await fetch("http://localhost:5001/coordinates", {
          method: "POST",
          body: JSON.stringify({ image: image.split(",")[1], description }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { image: base64 } = await res.json();
        setSrc(base64);
      }}
      className="space-y-3 h-screen"
    >
      <Input
        placeholder="Enter your description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="file"
        placeholder="Image name"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
      />
      <Button type="submit">Submit</Button>
      {src && <img className="w-1/2" src={`data:image/png;base64,${src}`} />}
    </form>
  );
}

export default DemoModel;
