import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { svglAngular, svglReact, svglNodejs,svglTypescript,svglJavascript,svglCsharp, svglPython, svglSupabase, svglUnity, svglThreejsDark, svglBlender, svglThreejsLight, svglGodotEngine, svglSqlServer, svglUnityDark, svglSwift } from '@ng-icons/svgl';

@Component({
  selector: 'app-about',
  imports: [NgIcon],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  providers: [
    provideIcons({
      svglAngular,
      svglReact,
      svglNodejs,
      svglTypescript,
      svglJavascript,
      svglCsharp,
      svglPython,
      svglSupabase,
      svglUnity,
      svglUnityDark,
      svglSwift,
      svglBlender,
      svglThreejsDark,
      svglThreejsLight,
      svglGodotEngine,
      svglSqlServer
    }),
  ],
})
export class AboutComponent {

  techStack = [
  { name: 'Angular', icon: 'svglAngular' },
  { name: 'React', icon: 'svglReact' },
  { name: 'TypeScript', icon: 'svglTypescript' },
  { name: 'JavaScript', icon: 'svglJavascript' },
  { name: 'Node.js', icon: 'svglNodejs' },
  { name: 'C#', icon: 'svglCsharp' },
  { name: 'Python', icon: 'svglPython' },
  { name: 'Supabase', icon: 'svglSupabase' },
  { name: 'Swift', icon: 'svglSwift' },

  // especiales (dark/light)
  { name: 'Unity', iconLight: 'svglUnity', iconDark: 'svglUnityDark' },
  { name: 'Three.js', iconLight: 'svglThreejsLight', iconDark: 'svglThreejsDark' },

  { name: 'SQL Server', icon: 'svglSqlServer' },
  { name: 'Godot', icon: 'svglGodotEngine' },
  { name: 'Blender', icon: 'svglBlender' },
];

}
