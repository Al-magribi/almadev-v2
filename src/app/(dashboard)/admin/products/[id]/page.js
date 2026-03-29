import { getProductLandingDetail } from "@/actions/product-actions";
import ProductManager from "@/components/admin/product/ProductManager";

export default async function AdminProductDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const rawData = await getProductLandingDetail(id);

  if (!rawData) return <div>Produk tidak ditemukan</div>;

  const cleanData = JSON.parse(JSON.stringify(rawData));
  return <ProductManager initialData={cleanData} />;
}
