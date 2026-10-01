from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from backend.services.verifier import default_verifier

router = APIRouter(prefix="/verification", tags=["Verification"])

class ClaimVerificationRequest(BaseModel):
    claim: str

@router.post("/verify-claim")
def verify_claim_endpoint(payload: ClaimVerificationRequest) -> Dict[str, Any]:
    """
    Stand-alone claim verification endpoint: compares a user-supplied assertion
    with available reliable open news and reference sources.
    """
    claim = payload.claim.strip() if payload.claim else ""
    if len(claim) < 5:
        raise HTTPException(status_code=400, detail="Claim statement is too short to verify.")

    return default_verifier.verify_claim(claim)
