import Navbar from '../Navbar/Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        {children}
      </main>
    </>
  );
}