import { siteConfig } from "@/lib/site";

/** One line of a project's materials list. */
export interface Material {
  item: string;
  quantity: string | number;
  cost?: number;
  link?: string;
}

const currency = new Intl.NumberFormat(siteConfig.locale, { style: "currency", currency: "USD" });

/** Sum of the costs that are present. */
export function totalCost(materials: Material[]): number {
  return materials.reduce((sum, material) => sum + (material.cost ?? 0), 0);
}

/** A materials table with a cost total, from a project's `materials` front matter. */
export function BillOfMaterials({ materials }: { materials: Material[] }) {
  if (materials.length === 0) return null;
  const hasCost = materials.some((material) => material.cost !== undefined);

  return (
    <div className="my-6 overflow-x-auto">
      <table>
        <caption className="sr-only">Bill of materials</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Quantity</th>
            {hasCost ? (
              <th scope="col" className="text-right">
                Cost
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.item}>
              <td>{material.link ? <a href={material.link}>{material.item}</a> : material.item}</td>
              <td>{material.quantity}</td>
              {hasCost ? (
                <td className="text-right tabular-nums">
                  {material.cost !== undefined ? currency.format(material.cost) : ""}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
        {hasCost ? (
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Total
              </th>
              <td className="text-right font-semibold tabular-nums">
                {currency.format(totalCost(materials))}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
