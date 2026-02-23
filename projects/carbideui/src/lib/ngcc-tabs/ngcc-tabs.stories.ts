import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { NgccTab } from './ngcc-tab';
import { NgccTabs } from './ngcc-tabs';
import { NgccTabsSkeleton } from './ngcc-tab-skeleton';

const meta: Meta<NgccTabs> = {
  title: 'Components/Tabs',
  component: NgccTabs,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, NgccTabs, NgccTab, NgccTabsSkeleton],
    }),
  ],
  argTypes: {
    type: {
      control: 'radio',
      options: ['line', 'contained'],
    },
  },
  args: {
    type: 'line',
  },
};

export default meta;
type Story = StoryObj<NgccTabs>;

export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
     <ngcc-tabs [type]="type">
  <ngcc-tab heading="One">One content</ngcc-tab>
  <ngcc-tab heading="Two">Two content</ngcc-tab>
  <ngcc-tab heading="Three">Three content</ngcc-tab>
</ngcc-tabs>
    `,
  }),
};

export const TabsWithTemplate: Story = {
  name: 'With custom heading template',
  args: {
    followFocus: true,
    isNavigation: false,
  },
  render: (args) => ({
    props: {
      ...args,
      data: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
    },
    template: `
      <ng-template #customTabs let-item>
        {{ item ? item.name : 'Loading...' }}
      </ng-template>

      <ng-template #iconTab>
        <div style="height: 14px;">
          Custom Icon Tab
          <svg width="16" height="16" viewBox="0 0 16 16"
               style="height: 14px; width: 14px; fill: #3d70b2;">
            <path d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path>
            <path d="M9 13H7V7h2z"></path>
            <path d="M7 4a1 1 0 1 1 2 0 1 1 0 1 1-2 0"></path>
          </svg>
        </div>
      </ng-template>

      <ngcc-tabs [type]="type" [followFocus]="followFocus" [isNavigation]="isNavigation">
        @for (item of data; track item.name) {
          <ngcc-tab [heading]="customTabs" [context]="item" title="Tab Content">
            Tab Content for {{ item.name }}
          </ngcc-tab>
        }
        <ngcc-tab [heading]="iconTab" title="Custom tab content">Tab Content Custom</ngcc-tab>
      </ngcc-tabs>
    `,
  }),
};

export const Tabs3: Story = {
  name: 'With before and after content',
  render: (args) => ({
    props: args,
    template: `
      <div class="section-title">Before</div>
<br>
      <ngcc-tabs [type]="type" [followFocus]="followFocus" [isNavigation]="isNavigation">
        <ngcc-tab heading="One">foo</ngcc-tab>
        <ngcc-tab heading="Two">bar</ngcc-tab>
        <span before>content before</span>
      </ngcc-tabs>
<br>
      <div class="section-title">After</div>
<br>
      <ngcc-tabs [type]="type" [followFocus]="followFocus" [isNavigation]="isNavigation">
        <ngcc-tab heading="One">foo</ngcc-tab>
        <ngcc-tab heading="Two">bar</ngcc-tab>
        <span after>content after</span>
      </ngcc-tabs>
<br>
      <div class="section-title">Both</div>
<br>
      <ngcc-tabs [type]="type" [followFocus]="followFocus" [isNavigation]="isNavigation">
        <ngcc-tab heading="One">foo</ngcc-tab>
        <ngcc-tab heading="Two">bar</ngcc-tab>
        <span before>content before</span>
        <span after>content after</span>
      </ngcc-tabs>
    `,
  }),
};

export const TabSkeleton: Story = {
  render: () => ({
    template: `
      <ngcc-tabs skeleton=true>
        <ngcc-tab></ngcc-tab>
        <ngcc-tab></ngcc-tab>
      </ngcc-tabs>

      <div style="margin-top: 5rem">
        <p>Tab skeleton component for ngcc-tab-header-group:</p>
        <ngcc-tabs-skeleton></ngcc-tabs-skeleton>
      </div>
    `,
  }),
};
