package web

import (
	"errors"
	"fmt"

	"github.com/asdine/storm"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
	"github.com/manyminds/api2go/jsonapi"
	"github.com/smartcontractkit/chainlink/services"
	"github.com/smartcontractkit/chainlink/store/models"
	"github.com/smartcontractkit/chainlink/store/presenters"
)

// ServiceAgreementsController manages service agreements.
type ServiceAgreementsController struct {
	App services.Application
}

// Create builds and saves a new service agreement record.
func (sac *ServiceAgreementsController) Create(c *gin.Context) {
	if !sac.App.GetStore().Config.Dev {
		publicError(c, 500, errors.New("Service Agreements are currently under development and not yet usable outside of development mode"))
		return
	}

	us, err := models.NewUnsignedServiceAgreementFromRequest(c.Request.Body)
	if err != nil {
		publicError(c, 422, err)
		return
	}

	sa, err := sac.App.GetStore().FindServiceAgreement(us.ID.String())
	if err == storm.ErrNotFound {
		sa, err = models.BuildServiceAgreement(us, sac.App.GetStore().KeyStore)
		if err != nil {
			publicError(c, 422, err)
			return
		} else if err = services.ValidateServiceAgreement(sa, sac.App.GetStore()); err != nil {
			publicError(c, 422, err)
			return
		} else if err = sac.App.GetStore().SaveServiceAgreement(&sa); err != nil {
			_ = c.AbortWithError(500, err)
			return
		} else if err = sac.App.AddJob(sa.JobSpec); err != nil {
			_ = c.AbortWithError(500, err)
			return
		}
	}
	if buffer, err := NewJSONAPIResponse(&sa); err != nil {
		_ = c.AbortWithError(500, fmt.Errorf("failed to marshal document: %+v", err))
	} else {
		c.Data(200, MediaType, buffer)
	}
}

// Show returns the details of a ServiceAgreement.
// Example:
//  "<application>/service_agreements/:SAID"
func (sac *ServiceAgreementsController) Show(c *gin.Context) {
	id := common.HexToHash(c.Param("SAID"))
	if sa, err := sac.App.GetStore().FindServiceAgreement(id.String()); err == storm.ErrNotFound {
		publicError(c, 404, errors.New("ServiceAgreement not found"))
	} else if err != nil {
		_ = c.AbortWithError(500, err)
		return
	} else if doc, err := jsonapi.MarshalToStruct(presenters.ServiceAgreement{ServiceAgreement: sa}, nil); err != nil {
		_ = c.AbortWithError(500, err)
		return
	} else {
		c.JSON(200, doc)
	}
}
