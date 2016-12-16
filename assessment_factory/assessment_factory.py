import json
import pkg_resources
import urllib
import logging

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, Float, Dict, List, Boolean
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader

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
        default={},
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

    set_retry_count = Integer(
        display_name="Retry Count Set In Studio",
        default=3,
        scope=Scope.settings,
        help="Number of retries user is allowed to use."
    )

    retry_count = Integer(
        display_name="Retry Count",
        default=3,
        scope=Scope.user_state,
        help="Number of retries user is allowed to use."
    )

    incorrect_items = List(
        display_name="Incorrect Items List",
        default=[],
        scope=Scope.user_state,
        help="List of incorrect items used for retrying."
    )

    correct_items = List(
        display_name="Correct Items List",
        default=[],
        scope=Scope.user_state,
        help="List of correct items used for retrying."
    )

    # Needed for grading
    has_score = Boolean(
        display_name="Scored",
        default=True,
        scope=Scope.settings,
        help="Select True if this component will receive a numerical score from the external LTI system."
    )

    problem_active = Boolean(
        display_name="Problem Started",
        default=False,
        scope=Scope.user_state,
        help="Default set to False. When user opens problem, sets to True."
    )

    allow_reset = Boolean(
        display_name="Allow Students To Reset",
        default=True,
        scope=Scope.settings,
        help="Boolean flag which determins if student can reset problem."
    )   

    allow_check = Boolean(
        display_name="Allow Students To Check Problem",
        default=True,
        scope=Scope.settings,
        help="Boolean flag which determins if student can check problem correctness."
    )    

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        context = {
            'weight': self.weight,
            'has_score': self.has_score,
            'allow_reset': self.allow_reset,
            'allow_check': self.allow_check,
            'set_retry_count': self.set_retry_count,
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
        self.runtime.publish(self, 'edx.assessment_factory.problem.loaded', {})

        if not self.problem_active:
            self.problem_active = True
            self.retry_count = self.set_retry_count

        context = {
            'display_name': self.display_name,
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'retry_count': self.retry_count,
            'is_graded': self.is_graded,
            'has_score': self.has_score,
            'allow_reset': self.allow_reset,
            'allow_check': self.allow_check
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
    def publish_event(self, data, suffix=''):
        try:
            event_type = data.pop('event_type')
        except KeyError:
            return {'result': 'error', 'message': 'Missing event_type in JSON data'}

        self.runtime.publish(self, event_type, data)
        return {'result': 'success'}

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        self.weight = float(data.get('weight'))
        self.has_score = data.get('has_score')
        self.allow_reset = data.get('allow_reset')
        self.allow_check = data.get('allow_check')
        self.set_retry_count = data.get('set_retry_count')
        self.studio_assignment = data

        return {'result': 'success'}

    @XBlock.json_handler
    def submit_item(self, data, suffix=''):
        item_id = data.get("item_id")
        self.item_state[item_id] = data;
        self.runtime.publish(self, 'edx.assessment_factory.item.dropped', {
            "item_id": item_id,
            "category_id": data.get("category_id"),
            "zone_id": data.get("zone_id")
        })

        return {'result': 'success'}

    @XBlock.json_handler
    def reset(self, data, suffix=''):
        self.item_state = {}
        self.correct_items = []
        self.incorrect_items = []
        self.retry_count = self.set_retry_count
        self.problem_active = False
        
        self.runtime.publish(self, 'edx.assessment_factory.problem.reset', {})

        return {
            'studio_assignment': self.studio_assignment,
            'item_state': self.item_state,
            'retry_count': self.retry_count
        }

    @XBlock.json_handler
    def check_problem(self, data, suffix=''):
        if self.item_state:
            if self.retry_count > 0: 
                data = self._get_correct_incorrect_items()
                if data['incorrect_items'] != self.incorrect_items and data['correct_items'] != self.correct_items:
                    self.retry_count -= 1
                    self.incorrect_items = data['incorrect_items']
                    self.correct_items = data['correct_items']

                    self.runtime.publish(self, 'edx.assessment_factory.problem.checked', {
                        "incorrect_items": data['incorrect_items'],
                        "correct_items": data['correct_items']
                    })
                                
        return {
            'incorrect_items': data['incorrect_items'],
            'correct_items': data['correct_items'],
            'retry_count': self.retry_count
        }

    @XBlock.json_handler
    def submit_problem(self, data, suffix=''):
        if not self.is_graded and self.has_score:
            grade = self._get_grade()
            self.runtime.publish(self, 'grade', {
                'value': grade,
                'max_value': self.weight,
            })
            self.is_graded = True

        return {
            'is_graded': self.is_graded,
            'grade': grade
        }

    def resource_string(self, path):
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def _get_grade(self):
        total_count = len(self.studio_assignment['items'])
        data = self._get_correct_incorrect_items()
        correct_count = len(data['correct_items'])

        return float(correct_count) / float(total_count) * self.weight

    def _get_correct_incorrect_items(self):
        incorrect_items = []
        correct_items = []
        for item in self.studio_assignment['items']:
            if item['id'] in self.item_state:
                item_id = item['id']
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