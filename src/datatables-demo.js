export const initDataTablesDemo = async (root = document) => {
  const table = root?.querySelector?.("[data-datatables-demo]");
  if (!table || table.dataset.datatablesReady === "true") return null;

  table.dataset.datatablesReady = "true";
  const { default: DataTable } = await import("datatables.net");
  const instance = new DataTable(table, {
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    order: [[3, "desc"]],
    layout: {
      topStart: {
        pageLength: {
          menu: [5, 10, 25],
        },
      },
      topEnd: {
        search: {
          placeholder: "Name, role, or office",
        },
      },
      bottomStart: "info",
      bottomEnd: {
        paging: {
          buttons: 3,
        },
      },
    },
    language: {
      entries: {
        _: "customers",
        1: "customer",
      },
      search: "Search customers:",
      zeroRecords: "No customers match that search.",
    },
  });

  const scrollRegion = table.closest(".dt-layout-table")?.querySelector(":scope > .dt-layout-cell");
  if (scrollRegion) {
    scrollRegion.setAttribute("role", "region");
    scrollRegion.setAttribute("tabindex", "0");
    scrollRegion.setAttribute("aria-label", "Customer directory results");
  }

  return instance;
};
