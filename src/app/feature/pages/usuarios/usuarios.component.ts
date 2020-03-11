import { Component, OnInit } from '@angular/core';
import { Usuario } from '../login/shared/models/usuario.model';
import { UsuarioService } from '../login/shared/services/usuario.service';
import { Tabla } from 'src/app/shared/enums/tablas.enum';
import { SwalService } from '../../../shared/services/swal.service';
import { Icon } from 'src/app/shared/enums/icon.enum';
import { UsuariosFormularioService } from './shared/services/usuarios-formulario.service';
import { TranslateService } from '@ngx-translate/core';
import { UploadImageService } from '../../../shared/services/upload-image.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cantidadUsuarios: number;
  roles;
  cargando = false;
  desde = 0;
  constructor(
    private usuarioService: UsuarioService,
    private swalService: SwalService,
    public usuariosFormularioService: UsuariosFormularioService,
    private translateService: TranslateService,
    public uploadImageService: UploadImageService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarOpcionesRoles();
    this.uploadImageService.notificar.subscribe(() => {
      this.cargarUsuarios();
    });
  }

  trackByFn(index) {
    return index;
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.obtenerUsuarios(this.desde).subscribe((respuesta: any) => {
      this.actualizarUsuarios(respuesta);
    });
  }

  cargarOpcionesRoles() {
    this.usuarioService.obtenerRoles().subscribe(respuesta => {
      this.roles = respuesta;
    });
  }

  limpiarUsuarios(input) {
    input.value = '';
    this.cargarUsuarios();
  }

  buscarUsuarios(palabra: string) {
    if (palabra.length > 0) {
      this.usuarioService.buscarUsuarios(Tabla.USUARIO, palabra).subscribe((respuesta: any) => {
        this.actualizarUsuarios(respuesta);
      });
    } else {
      this.cargarUsuarios();
    }
  }

  actualizarUsuarios(respuesta) {
    this.cantidadUsuarios = respuesta.total;
    this.usuarios = respuesta.usuarios ? respuesta.usuarios : respuesta.usuario;
    this.usuariosFormularioService.agregarVariosUsuarios(this.usuarios);
    this.usuariosFormularioService.save();
    this.cargando = false;
  }

  cambiarRangoUsuarios(valorRango: number) {
    const desde = this.desde + valorRango;
    if (desde >= this.cantidadUsuarios || desde < 0) {
      return;
    } else {
      this.desde += valorRango;
      this.cargarUsuarios();
    }
  }

  confirmarBorrarUsuario(id, nombre) {
    if (id === this.usuarioService.usuario._id) {
      this.swalService.alert('Error', this.translateService.instant('YouCannotDeleteYourself'), Icon.ERROR);
    } else {
      this.swalService.confirm(
        this.translateService.instant('Confirm'),
        this.translateService.instant('DeleteLabelConfirm', { name: nombre }),
        Icon.WARNING,
        this.translateService.instant('YesDelete'),
        this.translateService.instant('Cancel'),
        { clickConfirm: () => this.borrarUsuario(id) }
      );
    }
  }

  borrarUsuario(id: string) {
    return this.usuarioService.eliminarUsuario(id).subscribe(() => {
      this.desde = 0;
      this.cargarUsuarios();
      this.swalService.toast(this.translateService.instant('DeleteUserSuccess'));
    });
  }

  guardarUsuario(usuario: Usuario) {
    this.usuarioService
      .actualizarUsuario(usuario)
      .subscribe(() => this.swalService.toast(this.translateService.instant('DataUpdateSuccess')));
  }
}
