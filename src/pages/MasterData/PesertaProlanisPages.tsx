import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PesertaProlanisComponent from "../../components/master-data/PesertaProlanisComponent";

export default function PesertaProlanisPages() {
  return (
    <>
      <PageMeta
        title="Master Data | Data Peserta Prolanis"
        description=""
      />
      <PageBreadcrumb pageTitle="Data Peserta Prolnais" />
      <div className="space-y-6">
        <ComponentCard title="">
          <PesertaProlanisComponent />
        </ComponentCard>
      </div>
    </>
  );
}
