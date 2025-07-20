import dynamic from "next/dynamic";
import EditorPanel from "./_components/EditorPanel";
import HeaderWrapper from "./_components/HeaderWrapper";
import OutputPanel from "./_components/OutputPanel";

// Dynamically import EditorPanel to avoid SSR issues with Clerk
const DynamicEditorPanel = dynamic(() => import("./_components/EditorPanel"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] animate-pulse" />
});

export default function Home() {
  return (
   <>
   <div className="min-h-screen">
    <div className="max-w-[1800px] mx-auto p-4">
     <HeaderWrapper/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DynamicEditorPanel/>
        <OutputPanel/>
      </div>


    </div>
   </div>
   </>
  );
}
