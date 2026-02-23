import { applicationConfig, type Preview } from '@storybook/angular'
import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../projects/carbideui/documentation.json";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { provideZonelessChangeDetection } from '@angular/core';
import {initNgccTheme} from '../projects/carbideui/src/lib/ngcc-theme-switcher/ngcc-theme-init';

setCompodocJson(docJson);
initNgccTheme('white');
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(), // zoneless mode
      ],
    }),
    withThemeByDataAttribute({
      themes: {
        White: 'white',
        G10: 'g10',
        G90: 'g90',
        G100: 'g100',
        Rounded: 'rounded',
        Curved: 'curved',
        // Centered: 'centered'
      },
      defaultTheme: 'White',
      attributeName: 'data-carbon-theme',
      parentSelector: 'html',
    }),
  ]
};

export default preview;

