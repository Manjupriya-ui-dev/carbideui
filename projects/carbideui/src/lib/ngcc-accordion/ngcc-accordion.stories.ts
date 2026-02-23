import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccAccordion } from './ngcc-accordion';
import { NgccAccordionItem } from './ngcc-accordion-item';

const meta: Meta<NgccAccordion> = {
  title: 'Components/Accordion',
  component: NgccAccordion,
  decorators: [
    moduleMetadata({
      imports: [NgccAccordion, NgccAccordionItem],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    multi: { control: { type: 'boolean' } },
    size: { control: { type: 'radio' }, options: ['sm', 'md', 'lg'] },
    align: { control: { type: 'radio' }, options: ['start', 'end'] },
  },
  args: {
    multi: true,
    size: 'md',
    align: 'start',
  },
};
export default meta;

type Story = StoryObj<NgccAccordion>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-accordion [multi]="multi" [size]="size" [align]="align">
        <ngcc-accordion-item title="Section 1" [defaultOpen]="true">
          Content for section 1
        </ngcc-accordion-item>
        <ngcc-accordion-item title="Section 2">
          Content for section 2
        </ngcc-accordion-item>
      </ngcc-accordion>
    `,
  }),
};

export const MultiExpand: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <ngcc-accordion [multi]="multi" [size]="size" [align]="align">
        <ngcc-accordion-item title="First">
          First section content
        </ngcc-accordion-item>
        <ngcc-accordion-item title="Second" [defaultOpen]="true">
          Second section content
        </ngcc-accordion-item>
        <ngcc-accordion-item title="Third">
          Third section content
        </ngcc-accordion-item>
      </ngcc-accordion>
    `,
  }),
};

export const SingleExpand: Story = {
  render: (args) => ({
    props: { ...args, multi: false },
    template: `
      <ngcc-accordion [multi]="multi" [size]="size" [align]="align">
        <ngcc-accordion-item title="Alpha">
          Content for Alpha
        </ngcc-accordion-item>
        <ngcc-accordion-item title="Beta">
          Content for Beta
        </ngcc-accordion-item>
        <ngcc-accordion-item title="Gamma">
          Content for Gamma
        </ngcc-accordion-item>
      </ngcc-accordion>
    `,
  }),
};
