type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Product Details</h1>
      <p>Route: /product/{id}</p>
    </div>
  );
}
