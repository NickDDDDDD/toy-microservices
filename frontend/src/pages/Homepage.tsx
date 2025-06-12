import Chat from "../components/Chat";

const Homepage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-200 p-4">
      Home page
      <Chat />
    </div>
  );
};

export default Homepage;
