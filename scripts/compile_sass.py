import sass

BASE_DIR = 'assessment_factory/public/'
sass.compile(
    dirname=(BASE_DIR+'sass', BASE_DIR+'css/src'),
    include_paths=[BASE_DIR+'sass/vendor/bi-app'],
    output_style='compressed',
)