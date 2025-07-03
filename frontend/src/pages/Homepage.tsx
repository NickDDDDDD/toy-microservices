import Chat from "../components/Chat";
import Article from "../components/Article";
import EmptyDemo from "../components/EmptyDemo";

const Homepage = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 bg-neutral-200 p-4">
      <Chat />
      <Article />
      <EmptyDemo />
    </div>
  );
};

export default Homepage;
