import { Component,inject, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { svglAngular, svglReact, svglNodejs,svglTypescript,svglJavascript,svglCsharp, svglPython, svglSupabase, svglUnity, svglThreejsDark, svglBlender, svglThreejsLight, svglGodotEngine, svglSqlServer, svglUnityDark, svglSwift } from '@ng-icons/svgl';
import { SeoService } from '../../../../core/services/seo.service';

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
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);


  ngOnInit(): void {
    this.seo.update({
      title: 'Sobre mí | Marc Lidón',
      description:
        'Desarrollador de software con experiencia en productos full stack,integración de servicios de IA y sistemas en tiempo real.',
      keywords:
        'Marc Lidón, desarrollador software, Angular, Node.js, .NET, Python, Unity, IA aplicada, frontend, backend',
    });
  }
 

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
