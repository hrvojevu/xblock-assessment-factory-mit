import json
import pkg_resources
import urllib
import logging

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, Float, Dict, List, Boolean
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader

from .default_data import DEFAULT_DATA

loader = ResourceLoader(__name__)

class AssessmentFactoryXBlock(XBlock):
    """
    XBlock that implements problem solving using drag and drop functionality.
    """

    display_name = String(
        display_name="Title",
        default="Assessment Factory",        
        scope=Scope.settings,
        help="The title of the Assessment Factory problem. The title is displayed to learners.",
    )

    weight = Float(
        display_name="Weight",
        help="The maximum score the learner can receive for the problem",
        scope=Scope.settings,
        default=100,
    )

    studio_assignment = Dict(
        display_name="Studio Assignment Dictionary",
        default=DEFAULT_DATA,
        scope=Scope.settings,
        help="Dictionary containing items and categories that are set in studio."
    )

    item_state = Dict(
        display_name="Item State",
        default={},
        scope=Scope.user_state,
        help="Dictionary containing item state information."
    )

    is_graded = Boolean(
        help="Indicates whether the problem is graded.",
        scope=Scope.user_state,
        default=False,
    )

    # Needed for grading
    has_score = Boolean(
        display_name="Scored",
        default=False,
        scope=Scope.settings,
        help="Select True if this component will receive a numerical score from the external LTI system."
    ) 

    current_step = Integer(
        display_name="Current Step",
        default=0,
        scope=Scope.user_state,
        help="Number of current step user is on."
    )    

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        context = {
            'display_name': self.display_name,
            'weight': self.weight,
            'has_score': self.has_score,
            'studio_assignment': self.studio_assignment
        }
        frag = Fragment()
        frag.add_content(loader.render_template('/public/html/assessment_factory_edit.html', context))
        frag.add_css(self.resource_string("public/css/vendors/jquery-ui.css"))
        frag.add_css(self.resource_string("public/css/vendors/font-awesome.min.css"))
        frag.add_css(self.resource_string("public/css/src/assessment_factory_edit.css"))
        frag.add_javascript(self.resource_string("public/js/vendors/jquery-ui.min.js"))
        frag.add_javascript(self.resource_string("public/js/vendors/underscore.string.js"))
        frag.add_javascript(self.resource_string("public/js/src/assessment_factory_edit.js"))
        frag.initialize_js('AssessmentFactoryEditBlock', context)

        return frag

    def student_view(self, context=None):
        """
        The primary view of the AssessmentFactoryXBlock, shown to students
        when viewing courses.
        """
        context = {
            'display_name': self.display_name,
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'is_graded': self.is_graded,
            'has_score': self.has_score,
            'current_step': self.current_step
        }
        frag = Fragment()
        frag.add_content(loader.render_template('/public/html/assessment_factory.html', context))
        frag.add_css(self.resource_string("public/css/vendors/jquery-ui.css"))
        frag.add_css(self.resource_string("public/css/vendors/font-awesome.min.css"))
        frag.add_css(self.resource_string("public/css/src/assessment_factory.css"))
        frag.add_javascript(self.resource_string("public/js/vendors/jquery-ui.min.js"))
        frag.add_javascript(self.resource_string("public/js/vendors/underscore.string.js"))
        frag.add_javascript(self.resource_string("public/js/src/assessment_factory.js"))
        frag.initialize_js('AssessmentFactoryBlock', context)

        return frag

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        self.display_name = data.get('display_name')
        self.weight = float(data.get('weight'))
        self.has_score = data.get('has_score')
        self.studio_assignment = data
        return {'result': 'success'}

    @XBlock.json_handler
    def submit_items(self, data, suffix=''):
        for item in data:
            item_id = item.get("item_id")
            self.item_state[item_id] = item;

        return {'result': 'success'}

    @XBlock.json_handler
    def reset(self, data, suffix=''):
        self.item_state = {}
        self.current_step = 0

        return {
            'display_name': self.display_name,
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'current_step': self.current_step
        }

    @XBlock.json_handler
    def check_problem(self, data, suffix=''):
        if self.item_state:
            data = self._get_correct_incorrect_items_for_category(data.get("category_id"))

        return {
            'incorrect_items': data.get('incorrect_items'),
            'correct_items': data.get('correct_items')
        }

    @XBlock.json_handler
    def next_step(self, data, suffix=''):
        max_step = len(self.studio_assignment["categories"]*2)
        if self.current_step < max_step:
            self.current_step += 1

        for item in data:
            item_id = item.get("item_id")
            self.item_state[item_id] = item;
            
        return {
            'display_name': self.display_name,
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'current_step': self.current_step
        }

    @XBlock.json_handler
    def previous_step(self, data, suffix=''):
        min_step = 0
        if min_step < self.current_step:
            self.current_step -= 1
            
        if self.current_step == 0:
            self.item_state = {}

        return {
            'display_name': self.display_name,
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'current_step': self.current_step
        } 

    def resource_string(self, path):
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def _get_correct_incorrect_items_for_category(self, category_id):
        incorrect_items = []
        correct_items = []
        for item in self.studio_assignment['items']:
            if item['id'] in self.item_state:
                item_id = item['id']
                if self.item_state[item_id]['category_id'] == category_id:
                    if self.item_state[item_id]['zone_id'] == item['zone_id']:
                        correct_items.append(item_id)
                    else:
                        incorrect_items.append(item_id)
        return{
            'incorrect_items': incorrect_items,
            'correct_items': correct_items
        } 

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("AssessmentFactoryXBlock",
             """<assessment_factory/>
             """),
            ("Multiple AssessmentFactoryXBlock",
             """<vertical_demo>
                <assessment_factory/>
                <assessment_factory/>
                <assessment_factory/>
                </vertical_demo>
             """),
        ]