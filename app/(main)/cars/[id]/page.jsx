export default async function CarPage({ params }) {
  const { id } = await params;

  return <div>CarPage : {id}</div>;
}
