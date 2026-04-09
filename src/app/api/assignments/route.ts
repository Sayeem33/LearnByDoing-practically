import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import Tutorial from '@/models/Tutorial';
import UserProgress from '@/models/UserProgress';
import ConceptDefinition from '@/models/ConceptDefinition';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';
import {
  formatClassLabel,
  getAssignmentStudentStatus,
  getStudentClassKey,
  isAssignmentVisibleToStudent,
  summarizeAssignmentStatuses,
} from '@/lib/assignmentAnalytics';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.assignments.list);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (auth.user.role === 'student') {
      const student = await User.findById(auth.user.id).select('_id name institution grade');
      const classKey = getStudentClassKey(student);
      const assignments = await Assignment.find({}).sort({ dueDate: 1, createdAt: -1 });
      const progress = await UserProgress.findOne({ userId: auth.user.id });

      const visibleAssignments = assignments
        .filter((assignment) =>
          isAssignmentVisibleToStudent(assignment, auth.user.id, classKey)
        )
        .map((assignment) => {
          const status = getAssignmentStudentStatus(
            assignment.sourceType,
            assignment.sourceId,
            progress
          );

          return {
            ...assignment.toObject(),
            studentStatus: status,
            classLabel: classKey ? formatClassLabel(classKey) : 'No class assigned',
          };
        });

      return NextResponse.json({ success: true, data: visibleAssignments }, { status: 200 });
    }

    const assignmentQuery =
      auth.user.role === 'admin' ? {} : { createdBy: auth.user.id };

    const assignments = await Assignment.find(assignmentQuery).sort({ createdAt: -1 });
    const allStudents = await User.find({ role: 'student' }).select(
      '_id name email institution grade'
    );
    const allProgress = await UserProgress.find({});
    const progressByUserId = new Map(
      allProgress.map((progress) => [progress.userId.toString(), progress])
    );

    const enrichedAssignments = assignments.map((assignment) => {
      const assignedStudents = allStudents.filter((student) =>
        isAssignmentVisibleToStudent(
          assignment,
          student._id.toString(),
          getStudentClassKey(student)
        )
      );

      const statuses = assignedStudents.map((student) => {
        const classKey = getStudentClassKey(student);
        return {
          ...getAssignmentStudentStatus(
            assignment.sourceType,
            assignment.sourceId,
            progressByUserId.get(student._id.toString())
          ),
          classKey,
        };
      });

      return {
        ...assignment.toObject(),
        analytics: summarizeAssignmentStatuses(statuses),
        assignedStudents: assignedStudents.map((student) => ({
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          classLabel: getStudentClassKey(student)
            ? formatClassLabel(getStudentClassKey(student)!)
            : 'No class assigned',
        })),
      };
    });

    return NextResponse.json({ success: true, data: enrichedAssignments }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.assignments.create);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();
    const body = await request.json();
    const {
      title,
      description,
      sourceType,
      sourceId,
      dueDate,
      assignedStudentIds = [],
      assignedClasses = [],
    } = body || {};

    if (!title || !sourceType || !sourceId || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'title, sourceType, sourceId, and dueDate are required' },
        { status: 400 }
      );
    }

    if (!['lab', 'tutorial'].includes(sourceType)) {
      return NextResponse.json(
        { success: false, error: 'sourceType must be lab or tutorial' },
        { status: 400 }
      );
    }

    if (
      (!Array.isArray(assignedStudentIds) || assignedStudentIds.length === 0) &&
      (!Array.isArray(assignedClasses) || assignedClasses.length === 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'Choose at least one student or class' },
        { status: 400 }
      );
    }

    let sourceName = '';
    let sourceCategory = '';

    if (sourceType === 'lab') {
      const template = EXPERIMENT_TEMPLATES[sourceId as keyof typeof EXPERIMENT_TEMPLATES];
      if (template) {
        sourceName = template.name;
        sourceCategory = template.category;
      } else {
        const authoredDefinition = await ConceptDefinition.findOne({
          conceptId: sourceId,
          isPublished: true,
        }).select('name category');

        if (!authoredDefinition) {
          return NextResponse.json(
            { success: false, error: 'Selected lab was not found' },
            { status: 404 }
          );
        }

        sourceName = authoredDefinition.name;
        sourceCategory = authoredDefinition.category;
      }
    } else {
      const tutorial = await Tutorial.findOne({ experimentId: sourceId }).select(
        'experimentName category'
      );
      if (!tutorial) {
        return NextResponse.json(
          { success: false, error: 'Selected tutorial was not found' },
          { status: 404 }
        );
      }
      sourceName = tutorial.experimentName;
      sourceCategory = tutorial.category;
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      sourceType,
      sourceId,
      sourceName,
      sourceCategory,
      dueDate: new Date(dueDate),
      audienceType:
        assignedStudentIds.length > 0 && assignedClasses.length > 0
          ? 'mixed'
          : assignedClasses.length > 0
            ? 'classes'
            : 'students',
      assignedStudentIds,
      assignedClasses,
      createdBy: auth.user.id,
      createdByName: auth.user.name,
      creatorRole: auth.user.role,
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
