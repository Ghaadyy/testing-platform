import FilesTable from "@/components/FilesTable";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { TestFile } from "@/models/TestFile";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

function useTests() {
  const { token } = useContext(UserContext);
  return useQuery<TestFile[]>({
    queryKey: ["tests"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    },
  });
}

function HomeScreen() {
  const { data: tests, isLoading } = useTests();

  return isLoading ? <h1>Loading...</h1> : <FilesTable tests={tests!} />;
}

export default HomeScreen;
