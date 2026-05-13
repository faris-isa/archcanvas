import { AppLayout } from "./components/layout/AppLayout";
import { ArchFlow } from "./components/canvas/ArchFlow";
import { ReactFlowProvider } from "@xyflow/react";

function App() {
  return (
    <ReactFlowProvider>
      <AppLayout>
        <ArchFlow />
      </AppLayout>
    </ReactFlowProvider>
  );
}

export default App;
