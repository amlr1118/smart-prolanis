import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PenggunaComponent from "../../components/master-data/PenggunaComponent";

export default function PesertaProlanisPages() {
  return (
    <>
      <PageMeta
        title="Master Data | Data Peserta Prolanis"
        description=""
      />
      <PageBreadcrumb pageTitle="Data Pengguna" />
      <div className="space-y-6">
        <ComponentCard title="">
          <PenggunaComponent />
        </ComponentCard>
      </div>
    </>
  );
}
