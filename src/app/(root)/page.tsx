import EditorPanel from "./_components/EditorPanel";
import HeaderWrapper from "./_components/HeaderWrapper";
import OutputPanel from "./_components/OutputPanel";

export default function Home() {
  return (
   <>
   <div className="min-h-screen">
    <div className="max-w-[1800px] mx-auto p-4">
     <HeaderWrapper/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EditorPanel/>
        <OutputPanel/>
      </div>


    </div>
   </div>
   </>
  );
}
