type Props = { params: { id: string } }

export default function FormResponsesPage({ params }: Props) {
  const { id } = params
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Réponses du formulaire {id}</h1>
      <div className="mt-6 overflow-auto rounded border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Répondant</th>
              <th className="px-3 py-2">Soumis le</th>
              <th className="px-3 py-2">Q1</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2">-</td>
              <td className="px-3 py-2">-</td>
              <td className="px-3 py-2">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button className="rounded border px-3 py-2">Exporter CSV</button>
      </div>
    </main>
  )
}

