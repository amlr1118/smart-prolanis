import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import JadwalKegiatanComponent from "../../components/master-data/JadwalKegiatanComponent";

export default function JadwalKegiatanPages() {
  return (
    <>
      <PageMeta
        title="Master Data | Data Peserta Prolanis"
        description=""
      />
      <PageBreadcrumb pageTitle="Data Peserta Prolnais" />
      <div className="space-y-6">
        <ComponentCard title="">
          <JadwalKegiatanComponent />
        </ComponentCard>
      </div>
    </>
  );
}
