EN SHOES - Correções manuais aplicadas

Arquivos ajustados:
- components/combobox-field.tsx
  - Evita erro de options undefined / .length / .map.
  - Mantém opções padrão e valores vindos do Supabase.

- components/product-group-card.tsx
  - Evita erro quando variations vier vazio ou undefined.

- components/image-uploader.tsx
  - Mantém multi-upload real.
  - Usa safeImages ao adicionar imagens.
  - Valida tipo de arquivo e limite de 5MB.

- app/produto/[slug]/product-details-variations.tsx
  - Proteção contra variations undefined.
  - Mantém seletor de cor mesmo com uma única variação.

- app/admin/produtos/novo/page.tsx
  - Proteção contra arrays undefined.
  - Melhor geração de slug de variação: group_slug + variant_label.
  - Suporta /admin/produtos/novo?group_slug=...
  - Mantém regra de uma cor por cadastro.

- app/admin/produtos/[id]/page.tsx
  - Botões de corrigir cor agora ajustam color e variant_label juntos.
  - Incluído botão para adicionar nova cor do mesmo modelo usando group_slug.

Regras de uso:
1. Cada cor deve ser um produto/variação separada.
2. Variações do mesmo modelo devem usar o mesmo group_slug.
3. O slug do produto precisa ser único: group_slug + cor.
   Exemplo: nike-running-est-1972-preto-nude
4. O group_slug pode repetir.
5. O products.slug não pode repetir.

