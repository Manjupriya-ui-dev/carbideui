import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgccDatePicker } from './ngcc-date-picker';
import { NgccDatePickerCalendar } from './ngcc-date-picker-calendar';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';

const meta: Meta<NgccDatePicker> = {
  title: 'Components/DatePicker',
  tags: ['autodocs'],
  component: NgccDatePicker,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, NgccDatePicker, NgccDatePickerCalendar, NgccIcon],
    }),
  ],
  args: {
    placeholder: 'mm/dd/yyyy',
    size: 'md',
    format: 'MM/DD/YYYY',
  },
  argTypes: {
    format: { control: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
  },
};

export default meta;

type Story = StoryObj<NgccDatePicker>;

export const Simple: Story = {
  args: {
    type: 'simple',
    label: 'Simple Date Picker',
  },
};

export const Single: Story = {
  args: {
    type: 'single',
    label: 'Single Date Picker',
    helperText: 'Select a date',
  },
};

export const Range: Story = {
  args: {
    type: 'range',
    label: 'Range Date Picker',
  },
};

export const Invalid: Story = {
  args: {
    type: 'single',
    label: 'Invalid Example',
    invalid: true,
    invalidText: 'Please enter a valid date (MM/DD/YYYY)',
  },
};

export const Warning: Story = {
  args: {
    type: 'single',
    label: 'Warning Example',
    warn: true,
    warnText: 'Dates in the past may not be valid',
  },
};

export const Skeleton: Story = {
  args: {
    skeleton: true,
  },
};

export const WithReactiveForms: Story = {
  render: (args) => {
    const ctrl = new FormControl('');
    return {
      props: { ...args, ctrl },
      template: `
        <form>
          <ngcc-date-picker [formControl]="ctrl" label="Reactive Form"></ngcc-date-picker>
          <p style="margin-top:10px">Value: {{ ctrl.value }}</p>
        </form>
      `,
    };
  },
};

export const LocaleFrench: Story = {
  args: {
    type: 'single',
    label: 'French locale',
    locale: 'fr-FR',
  },
};

export const EmitDateObjects: Story = {
  args: {
    type: 'single',
    label: 'Emit Date objects',
    format: 'DD/MM/YYYY',
    emitDateObjects: true,
  },
  argTypes: {
    format: { control: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
  },
  render: (args) => {
    const ctrl = new FormControl('');
    return {
      props: { ...args, ctrl },
      template: `
        <form>
          <ngcc-date-picker [formControl]="ctrl" label="Emit Date objects"></ngcc-date-picker>
          <p style="margin-top:10px">Value: {{ ctrl.value }}</p>
        </form>
      `,
    };
  },
};

export const MinMaxExample: Story = {
  args: {
    type: 'single',
    label: 'Min/Max Example',
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
  },
};

export const DisabledDatesExample: Story = {
  args: {
    type: 'single',
    label: 'Disabled Dates',
    disabledDates: [new Date(new Date().getFullYear(), 8, 15)],
  },
};
