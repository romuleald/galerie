module.exports = function (grunt) {

    var pathcss = 'css/';
    var pathimg = 'img/';
    var pathjs = 'js/';
    var pathfonts = pathcss + 'font/';
    var pathpie = pathcss + 'pie/';
    var pathbuild = 'build/';
    var pathsrc = 'src/';

    // LOAD NPM TASKS
//    grunt.loadNpmTasks('grunt-contrib-sass');

    require('load-grunt-tasks')(grunt);


    /*
     grunt.loadNpmTasks('grunt-contrib-concat');
     grunt.loadNpmTasks('grunt-contrib-uglify'); // JS compression
     grunt.loadNpmTasks('grunt-contrib-cssmin');

     grunt.loadNpmTasks('grunt-fast-watch');

     //    grunt.loadNpmTasks('grunt-contrib-watch');
     grunt.loadNpmTasks('grunt-contrib-copy');
     grunt.loadNpmTasks('grunt-contrib-compress');  // zip
     grunt.loadNpmTasks('grunt-nunjucks'); // JS template
     grunt.loadNpmTasks('grunt-contrib-imagemin');  // compress images
     grunt.loadNpmTasks('grunt-nunjucks-2-html');
     grunt.loadNpmTasks('grunt-sass');
     */

    var images = [];
    grunt.file.recurse('src/assets', function(abspath, rootdir, subdir, filename){
        //console.info(abspath, rootdir, subdir, filename)
        images.push(filename.replace('.jpg', '-large.jpg'));
    });

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        responsive_images: {
            myTask: {
                options: {
                    //engine:'im',
                    sizes: [{
                        name: 'large',
                        width: 640,
                        quality: 80
                    }]
                },
                files: [{
                    expand: true,
                    src: ['assets/**.{jpg,gif,png}'],
                    cwd: 'src/',
                    dest: 'build/'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    // includes files within path and its sub-directories
                    {expand: true, cwd: pathsrc + pathimg, src: ['**'], dest: pathbuild + pathimg},
                    {expand: true, cwd: pathsrc + pathfonts, src: ['**'], dest: pathbuild + pathfonts},
                    {expand: true, cwd: pathsrc + pathpie, src: ['**'], dest: pathbuild + pathpie}
//                    {expand: true, cwd: pathcss + pathico, src: ['**'], dest: pathbuild + pathcss + pathico}
                ]
            }
        },
        watch: {
            JSlib: {
                // We watch and compile JS app files
                files: [pathsrc + pathjs + 'vendor/' + '*.js'],
                tasks: ['concat:scriptsvendor'],
                options: {
                    debounceDelay: 250
                }
            },
            JSapp: {
                // We watch and compile JSlib files
                files: [pathsrc + pathjs + '*.js'],
                tasks: ['concat:scriptsapp'],
                options: {
                    debounceDelay: 0
                }
            },
            sass: {
                // We watch and compile sass files as normal but don't live reload here
                files: [pathsrc + pathcss + '**/*.scss'],
                tasks: ['sass'],
                options: {
                    debounceDelay: 50
                }
            },
            nunjucks: {
                files: 'src/**/*.html',
                tasks: ['nunjucks'],
                options: {
                    livereload: true
                }

            },
            medias: {
                files: 'src/img/**',
                tasks: ['copy:main'],
                options: {
                    livereload: true
                }

            },
            livereload: {
                // Here we watch the files the sass task will compile to
                // These files are sent to the live reload server after sass compiles to them
                options: {livereload: true},
                files: [pathbuild + '**/*']
            }
        },
        compress: {
            main: {
                options: {
                    archive: pathbuild + 'archive.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: pathbuild,
                        src: ['**'],
                        dest: '/'
                    } // includes files in path
                ]
            }
        },
        nunjucks: {
            options: {
                data: {
                    "images" : (function(){

                        return images
                    })()
                }
            },
            render: {
                files: [
                    {
                        expand: true,
                        cwd: pathsrc,
                        src: "*.html",
                        dest: pathbuild,
                        ext: ".html"
                    }
                ]
            }
        },
        imagemin: {                        // Task
            dynamic: {                     // Another target
                files: [
                    {
                        expand: true,          // Enable dynamic expansion
                        cwd: pathbuild + pathimg,          // Src matches are relative to this path
                        src: ['**/*.png'],   // Actual patterns to match
                        dest: pathbuild + pathimg        // Destination path prefix
                    }
                ]
            }
        },
        interface: {
            files: ['index.html']
        }
    });

    // GRUNT CONFIG TASKS
    grunt.config('concat', {
        pkg: grunt.file.readJSON('package.json'),
        scriptsvendor: {
            options: {
                stripBanners: true,
                banner: '/* build <%= grunt.template.today("dd/mm/yyyy, HH:MM:ss") %> */'
            },
            src: [pathsrc + pathjs + 'vendor/*.js'],
            dest: pathbuild + pathjs + 'vendor.js'
        },
        scriptsapp: {
            options: {
                stripBanners: true,
                banner: '/* build <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            src: [pathsrc + pathjs + '*.js'],
            dest: pathbuild + pathjs + 'app.js'
        }
    });
    var filesuglify = {};
    filesuglify[pathbuild + pathjs + 'app.min.js'] = pathbuild + pathjs + 'app.js';
    var filessass = {};
    filessass[pathbuild + pathcss + 'all.css'] = pathsrc + pathcss + 'all.scss';
    var filescssmin = {};
    filescssmin[pathbuild + pathcss + 'all.min.css'] = pathbuild + pathcss + 'all.css';
    grunt.config('uglify', {options: {preserveComments: 'false'}, scripts: {files: filesuglify}});
    grunt.config('sass', {app: {files: filessass}});
    grunt.config('cssmin', {app: {files: filescssmin}});


    // REGISTER TAKS
    grunt.registerTask('clean',
        'Deletes the working folder and its contents', function () {
            grunt.file.delete(pathbuild, {force: true});
        });
    grunt.registerTask('deploy', 'Deploys files', ['clean', 'copy:main']);
    grunt.registerTask('build', "Builds the application.",
        ['clean', 'copy:main', 'concat', 'uglify', 'sass', 'cssmin', 'responsive_images', 'nunjucks']);
};
