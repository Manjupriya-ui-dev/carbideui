import { Meta, StoryObj } from '@storybook/angular';
import { NgccSkeleton } from './ngcc-skeleton';

const meta: Meta<NgccSkeleton> = {
  title: 'Components/Skeleton',
  component: NgccSkeleton,
  tags: ['autodocs'],
  argTypes: {
    rounded: { control: 'boolean' },
    width: { control: 'text' },
    height: { control: 'text' },
    radius: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<NgccSkeleton>;

export const Default: Story = {};
