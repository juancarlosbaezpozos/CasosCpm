'use strict';
module.exports = function (grunt) {

    // cargar tareas grunt automÃ¡ticamente
    require('load-grunt-tasks')(grunt);

    // mostrar horas en grunt
    require('time-grunt')(grunt);

    // cargar servidor estÃ¡tico
    var serveStatic = require('serve-static');

    // rutas configurables de la aplicaciÃ³n
    var appConfig = {
        app: 'app',
        dist: 'dist'
    };

    // configuraciÃ³n grunt
    grunt.initConfig({

        // propiedades del proyecto
        luna: appConfig,

        // propiedades del servidor grunt
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect().use(function (req, res, next) {
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', '*');
                                next();
                            }),
                            serveStatic('.tmp'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= luna.dist %>'
                }
            }
        },
        // compilar less a css
        less: {
            development: {
                options: {
                    compress: true,
                    optimization: 2
                },
                files: {
                    "app/styles/style.css": "app/less/style.less"
                }
            }
        },
        // mirar cambios en ediciÃ³n en vivo
        watch: {
            styles: {
                files: ['app/less/**/*.less'],
                tasks: ['less', 'copy:styles'],
                options: {
                    nospawn: true,
                    livereload: '<%= connect.options.livereload %>'
                },
            },
            js: {
                files: ['<%= luna.app %>/scripts/{,*/}*.js'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= luna.app %>/**/*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= luna.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        uglify: {
            options: {
                mangle: false
            }
        },
        // limpiar la carpeta dist
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= luna.dist %>/{,*/}*',
                        '!<%= luna.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        // copia los archivos remanentes donde otras tareas puedan usarlos
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= luna.app %>',
                        dest: '<%= luna.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            '*.html',
                            'views/{,*/}*.html',
                            'styles/img/*.*',
                            'images/{,*/}*.*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome',
                        src: ['fonts/*.*'],
                        dest: '<%= luna.dist %>'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/bootstrap',
                        src: ['fonts/*.*'],
                        dest: '<%= luna.dist %>'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'app/styles/pe-icons',
                        src: ['*.*'],
                        dest: '<%= luna.dist %>/styles/'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'app/styles/stroke-icons',
                        src: ['*.*'],
                        dest: '<%= luna.dist %>/styles/'
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= luna.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        // renombra los archivos para evitar caching del navegador
        filerev: {
            dist: {
                src: [
                    '<%= luna.dist %>/scripts/{,*/}*.js',
                    '<%= luna.dist %>/styles/{,*/}*.css',
                    '<%= luna.dist %>/styles/fonts/*'
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= luna.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= luna.dist %>'
                }]
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: ['dist/index.html']
        },
        deploy: {
            liveservers: {
                options: {
                    servers: [{
                        host: '127.0.0.1',
                        port: 9000,
                        username: 'administrador',
                        password: 'Passw0rdV360'
                    }],
                    deploy_path: 'app'
                }
            }
        }
    });

    grunt.registerTask('live', [
        'clean:server',
        'less',
        'copy:styles',
        'connect:livereload',
        'watch'
    ]);

    grunt.registerTask('server', [
        'build',
        'connect:dist:keepalive'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'less',
        'useminPrepare',
        'concat',
        'copy:dist',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.loadNpmTasks('grunt-deploy');
};
