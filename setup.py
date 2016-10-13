"""Setup for Assessment Factory XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='assessment_factory-xblock',
    version='0.1',
    description='Assessment Factory XBlock', 
    license='MIT',        
    packages=[
        'assessment_factory',
    ],
    install_requires=[
        'XBlock',
    ],
    entry_points={
        'xblock.v1': [
            'assessment_factory = assessment_factory:AssessmentFactoryXBlock',
        ]
    },
    package_data=package_data("assessment_factory", ["static", "public"]),
)
