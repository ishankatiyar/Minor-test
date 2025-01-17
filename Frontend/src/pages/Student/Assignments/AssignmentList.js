import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTimeElapsed, convertIsoToNormalTime } from "../../../Scripts/TimeFunctions";
import AssignmentListSkeleton from "../../../components/Skeletons/AssignmentListSkeleton";
import { fetchData } from '../../../Scripts/Axios';
import { Dropdown } from "react-bootstrap";
import UnsubmitAssignmentConfirmationModal from "../../../components/Modal/UnsubmitAssignmentConfirmationModal";
import { putAPI } from "../../../Scripts/Axios";

// List Type can be 'Pending', 'Missed' or 'Submitted'
function AssignmentList({ listType }) {
    const [assignments, setAssignments] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const handleShowConfirmationModal = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        setShowConfirmationModal(true);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
        setSelectedAssignmentId(null);
    };

    const handleUnsubmit = async () => {
        try {
            console.log("unsubmitting assignment with id : ", selectedAssignmentId);
            const response = await putAPI(`/students/assignment/unsubmit/${selectedAssignmentId}`);
            console.log(response.data);
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(`Error unsubmitting Assignment. Please try again later. err : ${error}`);
        }
    };

    useEffect(() => {
        fetchData(`/students/assignments/${listType.toLowerCase()}`, setAssignments, "Assignments", `Error fetching ${listType} Assignments. Please try again later`);
    }, [listType]);

    if (assignments === null) {
        return <AssignmentListSkeleton count={1} />;
    }

    return (
        <div className="container px-1 my-1">
            {assignments.length === 0 ? (
                <h6 className="text-center text-muted">No {listType} Assignments</h6>
            ) : (
                assignments.map((assignment, index) => (
                    <div key={index} className="row my-3 w-100">
                        <div className="col">
                            <div className="card shadow-sm" style={{ borderRadius: "15px" }}>
                                <div className="card-header d-flex align-items-center" style={{ background: "linear-gradient(135deg, #ffffff, #f0f4f8)" }}>
                                    <small className="text-muted">{assignment.PostedBy.Name}</small>
                                    <h5 className="text-center mb-0 flex-grow-1">{assignment.AssignmentName}</h5>
                                    {listType === "Submitted" && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleShowConfirmationModal(assignment._id)}>Unsubmit</button>
                                    )}
                                </div>
                                <div className="card-body" style={{ background: "linear-gradient(135deg, #ffffff, #f0f4f8)" }}>
                                    <p className="card-text">
                                        <strong>Posted On:</strong> {convertIsoToNormalTime(assignment.PostedOn).date} {convertIsoToNormalTime(assignment.PostedOn).time}{" "}
                                        <span className="text-muted">[ {getTimeElapsed(assignment.PostedOn)} ] </span>
                                    </p>
                                    <p className="card-text">
                                        <strong>Due Timestamp:</strong> {convertIsoToNormalTime(assignment.DueTimestamp).date} {convertIsoToNormalTime(assignment.DueTimestamp).time}{" "}
                                        <span className="text-muted">[ {getTimeElapsed(assignment.DueTimestamp)} ]</span>
                                    </p>
                                    <p className="card-text">
                                        <strong>Batches:</strong>{" "}
                                        {assignment.Batches.map((batch, batchIndex) => (
                                            <span key={batchIndex} className="badge bg-secondary mx-1">
                                                {batch}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                                <div className="card-footer d-flex justify-content-between" style={{ background: "linear-gradient(135deg, #ffffff, #f0f4f8)" }}>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                                            Questions ({assignment.Questions.length})
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            {assignment.Questions.map((questionid, index) => (
                                                <Dropdown.Item
                                                    key={index}
                                                    onClick={() => window.location.href = `/Question/Public/${questionid}`}
                                                >
                                                    Question {index + 1}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <button className="btn btn-primary btn-sm" onClick={() => {
                                        window.location.href = `/students/submissions/${assignment.AssignmentName}/${assignment._id}`;
                                    }}>Submissions ({assignment.SubmittedBy.length})</button>
                                    {listType === "Pending" && (
                                        <a href={`/students/solveAssignment/${assignment._id}`} className="btn btn-success btn-sm">Solve</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <UnsubmitAssignmentConfirmationModal show={showConfirmationModal} handleClose={handleCloseConfirmationModal} Label={"This Assignment"} handleUnsubmit={handleUnsubmit} />
        </div>
    );
}

export default AssignmentList;
