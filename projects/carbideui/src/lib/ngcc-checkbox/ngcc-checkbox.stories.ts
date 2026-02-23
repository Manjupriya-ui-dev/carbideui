import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccCheckbox } from './ngcc-checkbox';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

const meta: Meta<NgccCheckbox> = {
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  component: NgccCheckbox,
  decorators: [
    moduleMetadata({
      imports: [NgccCheckbox, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    errorMessage: { control: 'text' },
    skeleton: { control: 'boolean' },
    helperText: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<NgccCheckbox>;

export const Default: Story = {
  args: { label: 'Accept terms', helperText: 'You must agree before continuing' },
};

export const Required: Story = {
  args: { label: 'Accept terms', required: true, helperText: 'This is required' },
};

export const Disabled: Story = {
  args: { label: 'Disabled checkbox', disabled: true },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all',
    indeterminate: true,
    helperText: 'Mixed selection state',
  },
};

// ✅ Reactive Form Story
// export const ReactiveForm: Story = {
//   render: () => {
//     const fb = new FormBuilder();
//     const form = fb.group({
//       terms: [false, { nonNullable: true, validators: [Validators.requiredTrue] }],
//     });

//     const submit = () => {
//       form.markAllAsTouched(); // force validation
//     };

//     return {
//       props: { form, submit },
//       template: `
//         <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
//           <ngcc-checkbox
//             label="Accept Terms"
//             formControlName="terms"
//             required="true"
//             helperText="You must accept before submitting"
//           ></ngcc-checkbox>

//           <button type="submit">Submit</button>

//           <p>Form value: {{ form.value | json }}</p>
//           <p>Form valid: {{ form.valid }}</p>
//         </form>
//       `,
//     };
//   },
// };
