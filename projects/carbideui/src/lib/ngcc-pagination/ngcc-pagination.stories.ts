import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccPagination } from './ngcc-pagination';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';

const meta: Meta<NgccPagination> = {
  title: 'Components/Pagination',
  component: NgccPagination,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccPagination, NgccIcon],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **NgccPagination** component provides Carbon-styled pagination with keyboard navigation support.

### Usage

\`\`\`html
<ngcc-pagination
  [page]="1"
  [totalItems]="87"
  [pageSize]="10"
  [pageSizes]="[10, 20, 50, 100]"
  (pageChange)="onPageChange($event)"
  (pageSizeChange)="onPageSizeChange($event)">
</ngcc-pagination>
\`\`\`
        `,
      },
    },
  },
  args: {
    page: 1,
    totalItems: 87,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    loopNavigation: false,
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 }, description: 'Current page (1-based)' },
    totalItems: { control: { type: 'number', min: 0 }, description: 'Total number of items' },
    pageSize: { control: 'number', description: 'Current page size' },
    pageSizes: { control: 'object', description: 'Available page size options' },
    loopNavigation: { control: 'boolean', description: 'Enable loop keyboard navigation' },
    pageChange: { action: 'pageChange', description: 'Emitted when page changes' },
    pageSizeChange: { action: 'pageSizeChange', description: 'Emitted when page size changes' },
  },
};

export default meta;
type Story = StoryObj<NgccPagination>;

export const Default: Story = {};
