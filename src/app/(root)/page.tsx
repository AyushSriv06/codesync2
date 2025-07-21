import dynamic from "next/dynamic";

// Dynamically import EditorPanel to avoid SSR issues with Clerk
const DynamicEditorPanel = dynamic(() => import("./_components/EditorPanel"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] animate-pulse" />
});

// Dynamically import OutputPanel to avoid SSR issues
const DynamicOutputPanel = dynamic(() => import("./_components/OutputPanel"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] animate-pulse" />
});

// Dynamically import HeaderWrapper to avoid SSR issues with framer-motion
const DynamicHeaderWrapper = dynamic(() => import("./_components/HeaderWrapper"), {
  ssr: false,
  loading: () => <div className="h-16 bg-transparent animate-pulse" />
});

export default function Home() {
  return (
   <>
   <div className="min-h-screen">
    <div className="max-w-[1800px] mx-auto p-4">
     <DynamicHeaderWrapper/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DynamicEditorPanel/>
        <DynamicOutputPanel/>
      </div>


    </div>
   </div>
   </>
  );
}
