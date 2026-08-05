"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AdminPlaceholderPage } from "@/src/components/admin/AdminPlaceholderPage";

export default function GenericAdminSectionPage() {
  const params = useParams();
  const sectionRaw = (params?.section as string) || "Section";
  const sectionTitle = sectionRaw
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <AdminPlaceholderPage
      title={sectionTitle}
      description={`Faculty ${sectionTitle} control panel and dataset management.`}
    />
  );
}
