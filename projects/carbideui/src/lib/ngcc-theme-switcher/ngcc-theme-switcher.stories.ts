import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccThemeService } from './ngcc-theme.service';
import { NgccThemeSwitcher } from './ngcc-theme-switcher';

const meta: Meta<NgccThemeSwitcher> = {
  title: 'Components/Theme Switcher',
  tags: ['autodocs'],
  component: NgccThemeSwitcher,
  decorators: [
    moduleMetadata({
      providers: [NgccThemeService],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### 🧭 NgccThemeSwitcher Component

Use the **NgccThemeSwitcher** to easily toggle between available Ngcc themes.
It uses the **NgccThemeService** to apply the chosen theme globally via \`data-carbon-theme\`.

#### 🔧 Example Usage

\`\`\`html
<ngcc-theme-switcher></ngcc-theme-switcher>
\`\`\`

#### 🧠 Inside Your App

\`\`\`ts
import { NgccThemeService } from 'ngcc-angular';

constructor(private themeService: NgccThemeService) {
  this.themeService.setTheme('g100');
}

        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<NgccThemeSwitcher>;

export const Default: Story = {
  name: 'Default',
};
