import MainComponent from "../components/MainComponent";

function page() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="mt-6 sm:mt-8">
          <MainComponent />
        </div>
        {/* <NoteList /> */}
      </div>
    </div>
  );
}

export default page;
